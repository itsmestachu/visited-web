export type AppTab = "map" | "stats" | "profile";

export type AppHeaderProps = {
  tab: AppTab;
  onTab: (tab: AppTab) => void;
  visited: number;
  total: number;
  cities: number;
};
