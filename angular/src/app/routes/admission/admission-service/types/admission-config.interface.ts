export interface AdmissionConfig {
	username: {
		minLength: number, maxLength: number
	},
	password: {
		minLength: number, maxLength: number
	}
}
