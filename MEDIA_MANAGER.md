# Media Manager System

## Overview

The Media Manager is a unified system for handling image storage, transformation, and delivery in CardCollector. It decouples image storage from presentation logic, allowing the same source image to be served in multiple formats and sizes through declarative configuration.

## Motivation

### Problems with Current Approach

1. **Duplicate Logic**: Image processing code repeated across user, collector, and card handlers
2. **No Caching**: Every image request reads from disk and potentially re-processes
3. **Inflexible**: Changing image sizes requires code changes and recompilation
4. **No Responsive Images**: Single size for all screen resolutions
5. **Tight Coupling**: Image types (profile, card, etc.) hardcoded into storage paths

### Benefits of Media Manager

1. **DRY Principle**: Single implementation for all image operations
2. **Performance**: Multi-tier caching with thread-safe deduplication
3. **Flexibility**: Change image transformations via JSON configuration
4. **Responsive**: Multiple variants per image for different screen sizes
5. **Reusability**: Same source image can be used in multiple contexts
6. **Extensibility**: Add new effects without touching existing code

## Core Concepts

### 1. Source Images (Content-Addressable Storage)

Images are stored using their SHA-256 hash as the identifier:

```
/static/images/originals/a3f5e8d2c1b4...9f8e.bin
```

**Benefits:**
- Automatic deduplication (same image = same hash)
- Content-addressable (hash proves integrity)
- No need for UUID generation or sequential IDs

**Upload Flow:**
```
User uploads image → Hash content → Store as {hash}.bin → Return image_id (hash)
```

**Database Linkage:**
```rust
user.profile_image_id = "a3f5e8d2c1b4...9f8e";
collector.banner_image_id = "7c2d9f1a3e5b...4d2a";
card.card_image_id = "5b8f2e9d1c3a...7e4f";
```

### 2. Media Types (Transformation Pipelines)

A **media type** defines how to transform a source image for a specific use case. It consists of:
- **Name**: Identifier (e.g., "profile", "card", "banner")
- **Variants**: Different sizes/qualities (e.g., "thumbnail", "default", "large")
- **Effect Chains**: Ordered list of transformations to apply

**Key Insight:** Media types are NOT properties of images - they are transformation pipelines that can be applied to ANY image.

### 3. Effects (Composable Transformations)

An **effect** is a single image transformation operation:
- Identified by a string ID (e.g., "resize_square", "webp", "sharpen")
- Implemented in Rust as a trait
- Accepts parameters (e.g., `{"size": 500}`)
- Composable (chain multiple effects)

### 4. Variants (Size/Quality Configurations)

A **variant** defines a specific version of an image:
- Chain of effects to apply
- Metadata (dimensions, breakpoint)
- Generated on-first-request and cached

**Example:** The "profile" media type might have:
- `thumbnail`: 150x150, quality 90, no breakpoint
- `default`: 500x500, quality 100, breakpoint 768px
- `large`: 1000x1000, quality 100, breakpoint 1200px

## Architecture

### Component Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      MediaManager                            │
│  ┌────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │ EffectRegistry │  │ MediaTypeConfig │  │ ImageCache   │ │
│  │                │  │                 │  │              │ │
│  │ - resize_sq    │  │ - profile.json  │  │ - Get/Set    │ │
│  │ - resize_ratio │  │ - card.json     │  │ - Filesystem │ │
│  │ - webp         │  │ - banner.json   │  │ - Future:    │ │
│  │ - sharpen      │  │                 │  │   Redis/CDN  │ │
│  └────────────────┘  └─────────────────┘  └──────────────┘ │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐│
│  │         Generation Locks (Thread-Safe Queue)             ││
│  │  DashMap<CacheKey, Arc<Mutex<()>>>                       ││
│  │  Ensures only one generation per variant at a time       ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
        │                    │                    │
        ▼                    ▼                    ▼
   ┌─────────┐         ┌──────────┐        ┌──────────┐
   │ Rocket  │         │  Image   │        │  Cache   │
   │ Routes  │────────▶│ Storage  │        │ Storage  │
   └─────────┘         └──────────┘        └──────────┘
                       /static/images/      /static/images/
                       originals/           cache/
```

### Request Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ GET /media/profile/a3f5e8d2c1b4...9f8e/thumbnail                 │
└───────────────────────────┬─────────────────────────────────────┘
                            ▼
                 ┌──────────────────────┐
                 │ Check Cache          │
                 │ Key: profile/a3f5.../│
                 │      thumbnail       │
                 └──────────┬───────────┘
                            │
                ┌───────────┴───────────┐
                │                       │
           Cache HIT                Cache MISS
                │                       │
                ▼                       ▼
         Return cached        ┌─────────────────────┐
                              │ Acquire generation  │
                              │ lock for this key   │
                              └─────────┬───────────┘
                                        │
                              ┌─────────┴──────────┐
                              │ Double-check cache │
                              │ (maybe generated   │
                              │  while waiting)    │
                              └─────────┬──────────┘
                                        │
                            ┌───────────┴───────────┐
                            │                       │
                       Still MISS                  HIT
                            │                       │
                            ▼                       ▼
                 ┌────────────────────┐      Return cached
                 │ Load original      │
                 │ a3f5.../...bin     │
                 └──────────┬─────────┘
                            ▼
                 ┌────────────────────┐
                 │ Apply effect chain:│
                 │ 1. resize_square   │
                 │ 2. webp            │
                 └──────────┬─────────┘
                            ▼
                 ┌────────────────────┐
                 │ Cache result       │
                 │ Release lock       │
                 └──────────┬─────────┘
                            ▼
                      Return result
```

### Thread-Safe Deduplication

**Problem:** 100 concurrent requests for uncached image should generate once, not 100 times.

**Solution:** Per-cache-key mutex with double-check pattern

```rust
// Simplified pseudocode
async fn get_image(cache_key) {
    // Fast path - no lock needed
    if cached = check_cache(cache_key) {
        return cached;
    }

    // Get mutex for THIS specific cache_key
    lock = get_or_create_lock(cache_key);

    // Wait for lock - ensures serial generation
    acquire(lock).await;

    // Double-check - maybe generated while waiting
    if cached = check_cache(cache_key) {
        return cached;
    }

    // We're first - generate and cache
    result = generate();
    cache(result);

    return result;
}
```

**Result:**
- Request 1: Generates image
- Requests 2-100: Wait for lock, then find cached result

## API Design

### Upload Endpoints (Existing, Enhanced)

Upload still happens through entity-specific endpoints for authorization:

```http
PUT /user/{user_id}/profile-image
PUT /collector/{collector_id}/collector-image
PUT /card/{card_id}/card-image
PUT /collector/{collector_id}/banner-image

Content-Type: multipart/form-data

Response:
{
  "imageId": "a3f5e8d2c1b4...9f8e",
  "uploaded": true
}
```

**Backend Flow:**
1. Verify JWT token and permissions
2. Call `common_image_upload(file)` → returns hash-based image_id
3. Update entity in database: `SET profile_image_id = 'a3f5...'`
4. Return success

### Retrieval Endpoints (New Unified API)

```http
GET /media/{media_type}/{image_id}
GET /media/{media_type}/{image_id}/{variant}
GET /media/{media_type}/{image_id}/info

Examples:
GET /media/profile/a3f5e8d2.../default
GET /media/profile/a3f5e8d2.../thumbnail
GET /media/card/7c2d9f1a.../large
GET /media/banner/5b8f2e9d.../default
```

**Media Type**: Transformation pipeline to apply (profile, card, banner, etc.)
**Image ID**: Hash of source image
**Variant**: Size/quality variant (thumbnail, default, large)

### Info Endpoint (Responsive Images)

Returns metadata for building `<picture>` elements:

```http
GET /media/profile/a3f5e8d2c1b4...9f8e/info

Response:
{
  "type": "profile",
  "imageId": "a3f5e8d2c1b4...9f8e",
  "defaultVariant": "default",
  "variants": [
    {
      "name": "thumbnail",
      "url": "/media/profile/a3f5e8d2.../thumbnail",
      "width": 150,
      "height": 150,
      "format": "webp",
      "breakpoint": null
    },
    {
      "name": "default",
      "url": "/media/profile/a3f5e8d2.../default",
      "width": 500,
      "height": 500,
      "format": "webp",
      "breakpoint": 768
    },
    {
      "name": "large",
      "url": "/media/profile/a3f5e8d2.../large",
      "width": 1000,
      "height": 1000,
      "format": "webp",
      "breakpoint": 1200
    }
  ]
}
```

Angular client uses this to build:

```html
<picture>
  <source media="(min-width: 1200px)" srcset="/media/profile/a3f5.../large">
  <source media="(min-width: 768px)" srcset="/media/profile/a3f5.../default">
  <img src="/media/profile/a3f5.../thumbnail" width="150" height="150" alt="Profile">
</picture>
```

### Legacy Endpoints (Backward Compatibility)

Old endpoints redirect to new Media Manager:

```http
GET /user/{user_id}/profile-image
  → 301 Redirect to /media/profile/{profile_image_id}/default

GET /collector/{collector_id}/collector-image
  → 301 Redirect to /media/collector/{collector_image_id}/default

GET /card/{card_id}/card-image
  → 301 Redirect to /media/card/{card_image_id}/default
```

**Migration Strategy:**
1. Add new `/media/*` endpoints alongside old ones
2. Update Angular client to use new endpoints
3. Keep old endpoints as redirects for 1-2 versions
4. Eventually remove old endpoints

## Configuration Format

### Media Type JSON Schema

**Note:** The `"format"` field in metadata is optional and for documentation purposes. The actual output format is **automatically determined** by the effect chain.

```json
{
  "name": "profile",
  "description": "User profile images - circular display",
  "defaultVariant": "default",
  "variants": {
    "thumbnail": {
      "description": "Small circular avatar (mobile)",
      "effects": [
        {
          "id": "resize_square",
          "params": { "size": 150 }
        },
        {
          "id": "webp",
          "params": { "quality": 90 }
        }
      ],
      "metadata": {
        "width": 150,
        "height": 150
      },
      "breakpoint": null
    },
    "default": {
      "description": "Standard profile image (desktop)",
      "effects": [
        {
          "id": "resize_square",
          "params": { "size": 500 }
        },
        {
          "id": "webp",
          "params": { "quality": 100 }
        }
      ],
      "metadata": {
        "width": 500,
        "height": 500
      },
      "breakpoint": 768
    },
    "large": {
      "description": "High-resolution profile (large screens)",
      "effects": [
        {
          "id": "resize_square",
          "params": { "size": 1000 }
        },
        {
          "id": "webp",
          "params": { "quality": 100 }
        }
      ],
      "metadata": {
        "width": 1000,
        "height": 1000
      },
      "breakpoint": 1200
    }
  }
}
```

### Example: Card Media Type (Mixed Formats)

This example shows how different variants can output different formats:

```json
{
  "name": "card",
  "description": "Collectible card images - 330x516 aspect ratio",
  "defaultVariant": "default",
  "variants": {
    "thumbnail": {
      "description": "Small preview - JPEG for fast loading",
      "effects": [
        {
          "id": "resize_ratio",
          "params": { "width": 165, "height": 258 }
        },
        {
          "id": "jpeg",
          "params": { "quality": 85 }
        }
      ],
      "metadata": { "width": 165, "height": 258 },
      "breakpoint": null
    },
    "default": {
      "description": "Standard card - WebP for quality/size balance",
      "effects": [
        {
          "id": "resize_ratio",
          "params": { "width": 330, "height": 516 }
        },
        {
          "id": "sharpen",
          "params": { "amount": 1.2 }
        },
        {
          "id": "webp",
          "params": { "quality": 90 }
        }
      ],
      "metadata": { "width": 330, "height": 516 },
      "breakpoint": 768
    },
    "large": {
      "description": "High-res - PNG for lossless quality",
      "effects": [
        {
          "id": "resize_ratio",
          "params": { "width": 660, "height": 1032 }
        },
        {
          "id": "sharpen",
          "params": { "amount": 1.5 }
        },
        {
          "id": "png",
          "params": { "compression": 6 }
        }
      ],
      "metadata": { "width": 660, "height": 1032 },
      "breakpoint": 1200
    },
    "print": {
      "description": "Ultra high-res for printing - no format conversion (JPEG default)",
      "effects": [
        {
          "id": "resize_ratio",
          "params": { "width": 1320, "height": 2064 }
        }
      ],
      "metadata": { "width": 1320, "height": 2064 },
      "breakpoint": null
    }
  }
}
```

**Result:**
- `thumbnail` → `/cache/card/{id}/thumbnail.jpg` (JPEG)
- `default` → `/cache/card/{id}/default.webp` (WebP)
- `large` → `/cache/card/{id}/large.png` (PNG)
- `print` → `/cache/card/{id}/print.jpg` (JPEG default, no conversion)

### Configuration Loading

Media types loaded from `media-types/` directory on server startup:

```
media-types/
├── profile.json
├── collector.json
├── card.json
├── banner.json
└── achievement.json
```

Hot-reload support (future):
```rust
// Watch media-types/ directory for changes
// Reload on file modification (dev mode only)
```

## Effect System

### Effect Trait

```rust
pub trait ImageEffect: Send + Sync {
    /// Unique identifier for this effect
    fn id(&self) -> &'static str;

    /// Apply transformation to image
    fn apply(
        &self,
        image: DynamicImage,
        params: &EffectParams
    ) -> Result<DynamicImage, EffectError>;

    /// Returns the output format if this effect changes it
    /// Most effects (resize, sharpen, etc.) return None
    /// Only format conversion effects (webp, jpeg, png) return Some(format)
    fn output_format(&self) -> Option<ImageFormat> {
        None  // Default: effect doesn't change format
    }

    /// Validate parameters (optional)
    fn validate_params(&self, params: &EffectParams) -> Result<(), EffectError> {
        Ok(())
    }
}

/// Supported image formats
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ImageFormat {
    Jpeg,
    Png,
    WebP,
    Avif,
}

impl ImageFormat {
    pub fn extension(&self) -> &'static str {
        match self {
            ImageFormat::Jpeg => "jpg",
            ImageFormat::Png => "png",
            ImageFormat::WebP => "webp",
            ImageFormat::Avif => "avif",
        }
    }

    pub fn mime_type(&self) -> &'static str {
        match self {
            ImageFormat::Jpeg => "image/jpeg",
            ImageFormat::Png => "image/png",
            ImageFormat::WebP => "image/webp",
            ImageFormat::Avif => "image/avif",
        }
    }
}
```

### Format Determination

**Key Insight:** The output format is **dynamically determined** by the effect chain:

1. **Default format**: JPEG (if no format conversion effect is applied)
2. **Format effects**: `jpeg`, `png`, `webp`, `avif` change the output format
3. **Last format wins**: If multiple format effects in chain, the last one determines output

**Example:**
```json
{
  "effects": [
    { "id": "resize_square", "params": { "size": 500 } }
    // No format conversion → Output: JPEG (default)
  ]
}
```

```json
{
  "effects": [
    { "id": "resize_square", "params": { "size": 500 } },
    { "id": "webp", "params": { "quality": 90 } }
    // Has webp effect → Output: WebP
  ]
}
```

```json
{
  "effects": [
    { "id": "resize_square", "params": { "size": 500 } },
    { "id": "sharpen", "params": { "amount": 1.2 } },
    { "id": "png", "params": { "compression": 6 } }
    // Has png effect → Output: PNG
  ]
}
```

### Built-in Effects

#### Transformation Effects (No Format Change)

| Effect ID | Description | Parameters | Example |
|-----------|-------------|------------|---------|
| `resize_square` | Resize to square, crop center if needed | `size: u32` | `{"size": 500}` |
| `resize_ratio` | Resize to aspect ratio, crop center | `width: u32, height: u32` | `{"width": 330, "height": 516}` |
| `sharpen` | Apply unsharp mask | `amount: f32` | `{"amount": 1.2}` |
| `blur` | Apply gaussian blur | `sigma: f32` | `{"sigma": 2.0}` |
| `grayscale` | Convert to grayscale | None | `{}` |
| `brightness` | Adjust brightness | `amount: f32` (-1.0 to 1.0) | `{"amount": 0.2}` |
| `contrast` | Adjust contrast | `amount: f32` | `{"amount": 1.2}` |
| `rotate` | Rotate image | `degrees: f32` | `{"degrees": 90}` |
| `crop` | Crop to specific region | `x: u32, y: u32, width: u32, height: u32` | `{"x": 0, "y": 0, "width": 500, "height": 500}` |

#### Format Conversion Effects (Changes Output Format)

| Effect ID | Description | Parameters | Output Format | Example |
|-----------|-------------|------------|---------------|---------|
| `jpeg` | Convert to JPEG format | `quality: u32` (1-100) | JPEG | `{"quality": 85}` |
| `png` | Convert to PNG format | `compression: u32` (0-9) | PNG | `{"compression": 6}` |
| `webp` | Convert to WebP format | `quality: u32` (1-100), `lossless: bool` (optional) | WebP | `{"quality": 90}` |
| `avif` | Convert to AVIF format | `quality: u32` (1-100), `speed: u32` (0-10) | AVIF | `{"quality": 80, "speed": 4}` |

**Important:** If no format conversion effect is in the chain, the output defaults to **JPEG** format.

### Adding New Effects

1. Create new struct implementing `ImageEffect`
2. Register in `EffectRegistry::new()`
3. Use in media type JSON configs

#### Example: Transformation Effect (No Format Change)

```rust
// server/src/media/effects/blur.rs
pub struct BlurEffect;

impl ImageEffect for BlurEffect {
    fn id(&self) -> &'static str { "blur" }

    fn apply(&self, image: DynamicImage, params: &EffectParams) -> Result<DynamicImage> {
        let sigma = params.get_f32("sigma")?;
        Ok(image.blur(sigma))
    }

    // No output_format() override - uses default (None)
}
```

#### Example: Format Conversion Effect

```rust
// server/src/media/effects/webp.rs
pub struct WebPEffect;

impl ImageEffect for WebPEffect {
    fn id(&self) -> &'static str { "webp" }

    fn apply(&self, image: DynamicImage, params: &EffectParams) -> Result<DynamicImage> {
        let quality = params.get_u32("quality")?;
        // Convert to WebP (actual conversion happens in encoding)
        Ok(image)
    }

    fn output_format(&self) -> Option<ImageFormat> {
        Some(ImageFormat::WebP)  // This effect changes format to WebP
    }
}
```

#### Usage in JSON

```json
{
  "effects": [
    { "id": "blur", "params": { "sigma": 2.0 } },
    { "id": "webp", "params": { "quality": 90 } }
  ]
}
```

## Storage Layout

### Original Images (Source)

```
/static/images/originals/
├── a3f5e8d2c1b4...9f8e.bin
├── 7c2d9f1a3e5b...4d2a.bin
└── 5b8f2e9d1c3a...7e4f.bin
```

Hash = SHA-256 of file contents

### Cached Variants (Transformed)

**Important:** File extensions are **dynamically determined** by the effect chain's output format.

```
/static/images/cache/{media_type}/{image_id}/{variant}.{ext}

Where {ext} is determined by the final format:
- .jpg   (if no format conversion or jpeg effect)
- .png   (if png effect in chain)
- .webp  (if webp effect in chain)
- .avif  (if avif effect in chain)
```

**Examples:**

```
# Profile with WebP variants
/static/images/cache/profile/a3f5e8d2.../thumbnail.webp
/static/images/cache/profile/a3f5e8d2.../default.webp
/static/images/cache/profile/a3f5e8d2.../large.webp

# Card with mixed formats (same source image!)
/static/images/cache/card/a3f5e8d2.../thumbnail.jpg    # No format conversion
/static/images/cache/card/a3f5e8d2.../default.webp     # WebP effect
/static/images/cache/card/a3f5e8d2.../large.png        # PNG effect

# Banner using AVIF
/static/images/cache/banner/7c2d9f1a.../default.avif
```

**Format determination flow:**
```rust
// Pseudocode
let mut format = ImageFormat::Jpeg;  // Default

for effect in effect_chain {
    apply_effect(effect);
    if let Some(new_format) = effect.output_format() {
        format = new_format;  // Track format changes
    }
}

let extension = format.extension();  // "jpg", "webp", "png", "avif"
let cache_path = format!("cache/{media_type}/{image_id}/{variant}.{extension}");
```

### Database Schema Changes

```sql
-- Users
ALTER TABLE users ADD COLUMN profile_image_id VARCHAR(64);  -- SHA-256 hash

-- Collectors
ALTER TABLE collectors ADD COLUMN collector_image_id VARCHAR(64);
ALTER TABLE collectors ADD COLUMN banner_image_id VARCHAR(64);

-- Cards
ALTER TABLE cards ADD COLUMN card_image_id VARCHAR(64);

-- Future: Image metadata table (optional)
CREATE TABLE images (
    id VARCHAR(64) PRIMARY KEY,  -- SHA-256 hash
    original_filename VARCHAR(255),
    mime_type VARCHAR(50),
    file_size INTEGER,
    width INTEGER,
    height INTEGER,
    uploaded_at TIMESTAMP,
    uploaded_by INTEGER REFERENCES users(id)
);
```

## MediaManager Core Implementation

### Format Tracking Through Effect Chain

The MediaManager tracks the output format as it applies effects:

```rust
impl MediaManager {
    async fn generate_variant(
        &self,
        media_type: &str,
        image_id: &str,
        variant_name: &str,
    ) -> Result<(Vec<u8>, ImageFormat)> {
        // Load original image
        let original_bytes = self.load_original(image_id).await?;
        let mut image = image::load_from_memory(&original_bytes)?;

        // Default format is JPEG
        let mut current_format = ImageFormat::Jpeg;

        // Get variant configuration
        let media_config = self.media_types.get(media_type)?;
        let variant_config = media_config.variants.get(variant_name)?;

        // Apply effect chain, tracking format changes
        for effect_spec in &variant_config.effects {
            let effect = self.effect_registry.get(&effect_spec.id)?;

            // Apply the transformation
            image = effect.apply(image, &effect_spec.params)?;

            // Track format changes
            if let Some(new_format) = effect.output_format() {
                current_format = new_format;
            }
        }

        // Encode image to bytes in the final format
        let bytes = self.encode_image(image, current_format, &variant_config)?;

        Ok((bytes, current_format))
    }

    fn encode_image(
        &self,
        image: DynamicImage,
        format: ImageFormat,
        config: &VariantConfig,
    ) -> Result<Vec<u8>> {
        let mut buffer = Vec::new();

        match format {
            ImageFormat::Jpeg => {
                let quality = config.get_quality().unwrap_or(85);
                let encoder = JpegEncoder::new_with_quality(&mut buffer, quality);
                image.write_with_encoder(encoder)?;
            }
            ImageFormat::Png => {
                let compression = config.get_compression().unwrap_or(6);
                let encoder = PngEncoder::new_with_quality(
                    &mut buffer,
                    CompressionType::Default,
                    FilterType::Sub,
                );
                image.write_with_encoder(encoder)?;
            }
            ImageFormat::WebP => {
                // WebP encoding via libwebp or image crate
                let quality = config.get_quality().unwrap_or(90);
                // ... WebP encoding logic
            }
            ImageFormat::Avif => {
                // AVIF encoding via libavif
                let quality = config.get_quality().unwrap_or(80);
                // ... AVIF encoding logic
            }
        }

        Ok(buffer)
    }
}
```

### Cache Key Generation

Cache keys must include format information implicitly through the effect chain hash:

```rust
// Cache key includes media type, image ID, and variant name
// Format is determined dynamically when generating/loading
let cache_key = format!("{}/{}/{}", media_type, image_id, variant_name);

// File path includes the actual format extension
let file_extension = current_format.extension();
let cache_path = format!(
    "static/images/cache/{}/{}/{}.{}",
    media_type, image_id, variant_name, file_extension
);
```

### Info Endpoint Format Detection

The `/info` endpoint must determine format for each variant:

```rust
#[get("/media/<media_type>/<image_id>/info")]
async fn get_media_info(
    media_type: String,
    image_id: String,
    media_manager: &State<MediaManager>,
) -> Result<Json<MediaInfo>> {
    let media_config = media_manager.get_media_type(&media_type)?;

    let mut variants = Vec::new();
    for (variant_name, variant_config) in &media_config.variants {
        // Determine format by analyzing effect chain
        let format = media_manager.determine_variant_format(variant_config);

        variants.push(VariantInfo {
            name: variant_name.clone(),
            url: format!("/media/{}/{}/{}", media_type, image_id, variant_name),
            width: variant_config.metadata.width,
            height: variant_config.metadata.height,
            format: format.to_string(),  // "jpeg", "webp", "png", "avif"
            breakpoint: variant_config.breakpoint,
        });
    }

    Ok(Json(MediaInfo {
        type_name: media_type,
        image_id,
        default_variant: media_config.default_variant.clone(),
        variants,
    }))
}

impl MediaManager {
    fn determine_variant_format(&self, config: &VariantConfig) -> ImageFormat {
        let mut format = ImageFormat::Jpeg;  // Default

        // Scan effect chain for format conversion effects
        for effect_spec in &config.effects {
            if let Some(effect) = self.effect_registry.get(&effect_spec.id) {
                if let Some(new_format) = effect.output_format() {
                    format = new_format;
                }
            }
        }

        format
    }
}
```

## Implementation Plan

### Phase 1: Core Infrastructure

- [ ] Create `server/src/media/` module structure
- [ ] Implement `ImageEffect` trait with `output_format()` method and `EffectRegistry`
- [ ] Implement `ImageFormat` enum with extension/mime_type helpers
- [ ] Implement basic effects: `resize_square`, `resize_ratio`
- [ ] Implement format effects: `jpeg`, `png`, `webp` (avif later)
- [ ] Create `MediaTypeConfig` with JSON loading
- [ ] Implement `ImageCache` trait with filesystem backend
- [ ] Create hash-based image storage in `storage.rs`

### Phase 2: Media Manager

- [ ] Implement `MediaManager` with thread-safe deduplication
- [ ] Add generation locks using `DashMap<String, Arc<Mutex<()>>>`
- [ ] Implement effect chain application with format tracking
- [ ] Implement `encode_image()` with format-specific encoding
- [ ] Implement `determine_variant_format()` for info endpoint
- [ ] Add comprehensive error handling
- [ ] Write unit tests for format tracking logic

### Phase 3: API Endpoints

- [ ] Create unified GET endpoints: `/media/{type}/{id}/{variant?}`
- [ ] Create info endpoint: `/media/{type}/{id}/info`
- [ ] Refactor existing upload handlers to use `common_image_upload()`
- [ ] Add legacy endpoint redirects for backward compatibility
- [ ] Initialize `MediaManager` in Rocket `main.rs`

### Phase 4: Configuration & Testing

- [ ] Create JSON configs: `profile.json`, `card.json`, `collector.json`, `banner.json`
- [ ] Add config validation on startup
- [ ] Write integration tests for end-to-end flows
- [ ] Performance testing for concurrent requests
- [ ] Cache hit rate metrics

### Phase 5: Frontend Integration

- [ ] Create Angular `MediaService` for fetching image info
- [ ] Create `ResponsiveImageComponent` that auto-builds `<picture>` elements
- [ ] Update existing components to use new endpoints
- [ ] Add loading states and error handling
- [ ] Performance monitoring (cache hit rates, load times)

### Phase 6: Advanced Features (Future)

- [ ] Background job queue for async variant generation
- [ ] Image metadata extraction (EXIF, dimensions, color profiles)
- [ ] Bulk operations (regenerate all variants, cleanup orphans)
- [ ] Hot-reload configuration in dev mode
- [ ] WebP fallback for browsers without support
- [ ] AVIF format support

## Usage Examples

### Backend: Upload Image

```rust
#[put("/user/<user_id>/profile-image", data = "<file>")]
async fn upload_profile_image(
    user_id: i32,
    file: Form<FileUpload>,
    media_manager: &State<MediaManager>,
    auth: AuthGuard,
) -> Result<Json<UploadResponse>> {
    // Verify authorization
    auth.require_user_or_admin(user_id)?;

    // Common upload function (hash-based storage)
    let image_id = media_manager.upload_image(file.data).await?;

    // Update database
    db.execute(
        "UPDATE users SET profile_image_id = ? WHERE id = ?",
        [&image_id, &user_id]
    )?;

    Ok(Json(UploadResponse { image_id, uploaded: true }))
}
```

### Backend: Retrieve Image

```rust
#[get("/media/<media_type>/<image_id>/<variant>")]
async fn get_media(
    media_type: String,
    image_id: String,
    variant: String,
    media_manager: &State<MediaManager>,
) -> Result<Response<'static>> {
    // Returns both the image bytes and the detected format
    let (bytes, format) = media_manager
        .get_image(&media_type, &image_id, Some(&variant))
        .await?;

    // Set Content-Type based on actual format
    let mime_type = format.mime_type();  // "image/jpeg", "image/webp", etc.

    Response::build()
        .header(ContentType::parse_flexible(mime_type).unwrap())
        .header(Header::new("Cache-Control", "public, max-age=31536000"))
        .sized_body(Some(bytes.len()), Cursor::new(bytes))
        .ok()
}
```

### Frontend: Responsive Image Component

```typescript
// media.service.ts
export class MediaService {
  async getImageInfo(type: string, imageId: string): Promise<MediaInfo> {
    return this.http.get<MediaInfo>(`/media/${type}/${imageId}/info`).toPromise();
  }
}

// responsive-image.component.ts
@Component({
  selector: 'app-responsive-image',
  template: `
    <picture *ngIf="imageInfo">
      <source
        *ngFor="let variant of sortedVariants"
        [media]="'(min-width: ' + variant.breakpoint + 'px)'"
        [srcset]="variant.url">
      <img
        [src]="defaultVariant.url"
        [width]="defaultVariant.width"
        [height]="defaultVariant.height"
        [alt]="alt">
    </picture>
  `
})
export class ResponsiveImageComponent implements OnInit {
  @Input() mediaType: string;
  @Input() imageId: string;
  @Input() alt: string;

  imageInfo: MediaInfo;

  async ngOnInit() {
    this.imageInfo = await this.mediaService.getImageInfo(
      this.mediaType,
      this.imageId
    );
  }

  get sortedVariants() {
    return this.imageInfo.variants
      .filter(v => v.breakpoint)
      .sort((a, b) => b.breakpoint - a.breakpoint);
  }

  get defaultVariant() {
    return this.imageInfo.variants.find(
      v => v.name === this.imageInfo.defaultVariant
    );
  }
}
```

### Frontend: Usage

```html
<!-- Simple usage -->
<app-responsive-image
  mediaType="profile"
  [imageId]="user.profileImageId"
  alt="User profile">
</app-responsive-image>

<!-- Card image -->
<app-responsive-image
  mediaType="card"
  [imageId]="card.cardImageId"
  alt="Card artwork">
</app-responsive-image>

<!-- Banner -->
<app-responsive-image
  mediaType="banner"
  [imageId]="collector.bannerImageId"
  alt="Collector banner">
</app-responsive-image>
```

## Performance Considerations

### Caching Strategy

1. **Browser Cache**: `Cache-Control: public, max-age=31536000` (1 year)
   - Images are content-addressable (hash-based)
   - Changed images = new hash = new URL

2. **Filesystem Cache**: `/static/images/cache/`
   - Lazy generation on first request
   - Persistent across server restarts

### Thread Safety

- **Per-key locks**: Only one generation per variant at a time
- **DashMap**: Lock-free concurrent HashMap
- **Double-check pattern**: Minimize lock contention
- **Read-heavy optimization**: Cache checks don't acquire locks

### Scalability

- **Lazy generation**: Only create what's requested
- **Horizontal scaling**: Shared Redis cache across instances
- **Background jobs** (Future): Pre-generate popular variants

## Migration Guide

### Step 1: Deploy Media Manager (Backward Compatible)

- Deploy new `/media/*` endpoints
- Keep existing endpoints unchanged
- No client changes required

### Step 2: Update Frontend

- Update Angular components to use new endpoints
- Add `ResponsiveImageComponent` for new features
- Test thoroughly

### Step 3: Database Migration

- Add `*_image_id` columns with hash values
- Migrate existing images to hash-based storage
- Populate image IDs in database

### Step 4: Deprecation

- Add deprecation warnings to old endpoints
- Monitor usage metrics
- Remove old endpoints after 2-3 releases

## Security Considerations

1. **Authorization**: Upload still requires entity-level permissions
2. **Path Traversal**: All image IDs validated (hash format)
3. **Content Type**: Validate uploaded files are actual images
4. **Size Limits**: Enforce maximum file size (e.g., 10MB)
5. **Rate Limiting**: Prevent abuse of transformation endpoints
6. **Cache Poisoning**: Hash-based IDs prevent malicious overwrites

## Monitoring & Observability

### Metrics to Track

- Cache hit rate (filesystem, memory, CDN)
- Average generation time per media type
- Concurrent request handling (lock contention)
- Storage usage (originals vs. cached variants)
- Most requested media types/variants
- Error rates by effect type

## Future Enhancements

1. **Automatic Format Detection**: Serve WebP to supporting browsers, JPEG to others
2. **Background Processing**: Queue-based async generation

## References

- [WebP Documentation](https://developers.google.com/speed/webp)
- [Responsive Images (MDN)](https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images)
- [Content-Addressable Storage](https://en.wikipedia.org/wiki/Content-addressable_storage)
- [OpenCV Rust Bindings](https://github.com/twistedfall/opencv-rust)
- [DashMap Documentation](https://docs.rs/dashmap/)
