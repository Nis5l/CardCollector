pub fn bcrypt_hash(password: &str) -> bcrypt::BcryptResult<String> {
    bcrypt::hash(password, 10)
}

pub fn bcrypt_verify(password: &str, hash: &str) -> bcrypt::BcryptResult<bool> {
    bcrypt::verify(password, hash)
}
