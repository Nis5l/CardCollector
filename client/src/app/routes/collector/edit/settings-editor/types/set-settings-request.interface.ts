export interface SetSettingsRequest {
    packCooldown?: number | null | undefined,
    //packAmount?: number | null | undefined, //TODO: "disable" for now
    packQualityMin?: number | null | undefined,
    packQualityMax?: number | null | undefined,
}
