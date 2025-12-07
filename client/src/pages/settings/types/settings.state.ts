export interface SettingsState {
  loading: boolean;
  mail: string;
  showpass: string;

  passwordopen: boolean;
  password: string;
  passwordRepeat: string;
  passwordRepeatWrong: boolean;
  passwordWrong: boolean;
  passwordMessage: string | undefined;
}
