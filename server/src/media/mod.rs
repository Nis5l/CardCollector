pub mod effect;
pub mod effect_registry;
pub mod effects;
pub mod config;
pub mod cache;
pub mod storage;
pub mod manager;
pub mod routes;

// Re-export commonly used types
pub use effect::{ImageEffect, ImageFormat, EffectParams, EffectError};
pub use effect_registry::EffectRegistry;
pub use config::{MediaTypeConfig, VariantConfig, EffectSpec, ConfigError};
pub use cache::{ImageCache, CacheKey, CacheError, FilesystemCache};
pub use storage::{ImageStorage, StorageError};
pub use manager::{MediaManager, ManagerError, MediaInfo, VariantInfo};
