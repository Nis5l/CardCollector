use std::collections::HashMap;
use std::sync::Arc;
use super::effect::ImageEffect;

/// Registry for all available image effects
pub struct EffectRegistry {
    effects: HashMap<String, Arc<dyn ImageEffect>>,
}

impl EffectRegistry {
    /// Create a new registry and register all built-in effects
    pub fn new() -> Self {
        let mut registry = Self {
            effects: HashMap::new(),
        };

        // Register transformation effects
        registry.register(Arc::new(crate::media::effects::ResizeSquareEffect));
        registry.register(Arc::new(crate::media::effects::ResizeRatioEffect));

        // Register format conversion effects
        registry.register(Arc::new(crate::media::effects::WebPEffect));
        registry.register(Arc::new(crate::media::effects::JpegEffect));
        registry.register(Arc::new(crate::media::effects::PngEffect));

        registry
    }

    /// Register a new effect
    pub fn register(&mut self, effect: Arc<dyn ImageEffect>) {
        let id = effect.id().to_string();
        self.effects.insert(id, effect);
    }

    /// Get an effect by ID
    pub fn get(&self, id: &str) -> Option<&dyn ImageEffect> {
        self.effects.get(id).map(|arc| arc.as_ref())
    }

    /// Check if an effect exists
    pub fn has(&self, id: &str) -> bool {
        self.effects.contains_key(id)
    }

    /// Get all registered effect IDs
    pub fn effect_ids(&self) -> Vec<String> {
        self.effects.keys().cloned().collect()
    }
}

impl Default for EffectRegistry {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::media::effect::{EffectParams, EffectError, ImageFormat};
    use opencv::core::Mat;

    // Mock effect for testing
    struct MockEffect;

    impl ImageEffect for MockEffect {
        fn id(&self) -> &'static str {
            "mock"
        }

        fn apply(&self, image: Mat, _params: &EffectParams) -> Result<Mat, EffectError> {
            Ok(image)
        }
    }

    #[test]
    fn test_registry_basic() {
        let mut registry = EffectRegistry::new();
        assert_eq!(registry.effect_ids().len(), 0);

        registry.register(Arc::new(MockEffect));
        assert!(registry.has("mock"));
        assert!(registry.get("mock").is_some());
        assert_eq!(registry.effect_ids().len(), 1);
    }
}
