export type AppTab = "map" | "stats";

export type AppHeaderProps = {
  tab: AppTab;
  onTab: (tab: AppTab) => void;
  visited: number;
  total: number;
  cities: number;
};
