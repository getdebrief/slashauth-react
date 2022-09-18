export interface SlashAuthOptions {
  componentSettings?: SlashAuthStyle;
}

export interface SlashAuthModalStyle {
  backgroundColor?: string;
  borderRadius?: string;
  alignItems?: string;
  fontFamily?: string;
  fontColor?: string;
  buttonBackgroundColor?: string;
  hoverButtonBackgroundColor?: string;
  iconURL?: string;
}

export interface ComputedSlashAuthModalStyle {
  backgroundColor: string;
  borderRadius: string;
  alignItems: string;
  fontFamily: string;
  fontColor: string;
  buttonBackgroundColor: string;
  hoverButtonBackgroundColor: string;
  iconURL: string;
}

export interface SlashAuthStyle {
  signInModalStyle: SlashAuthModalStyle;
}
