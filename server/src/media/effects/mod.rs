// Image transformation effects
pub mod resize_square;
pub mod resize_ratio;

// Format conversion effects
pub mod webp;
pub mod jpeg;
pub mod png;

// Future effects
// pub mod sharpen;
// pub mod blur;
// pub mod grayscale;

// Re-export for convenience
pub use resize_square::ResizeSquareEffect;
pub use resize_ratio::ResizeRatioEffect;
pub use webp::WebPEffect;
pub use jpeg::JpegEffect;
pub use png::PngEffect;
