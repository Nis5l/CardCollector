export interface NavigationItem {
  name: string,
  icon: string,
  link: string | (() => string)
}
