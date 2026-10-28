import { Bar, Counter, CounterItem, Logo, LogoDot, LogoKicker, LogoWord, Tab, Tabs } from "./AppHeader.styles";
import type { AppHeaderProps } from "./AppHeader.types";

export function AppHeader({ tab, onTab, visited, total, cities }: AppHeaderProps) {
  return (
    <Bar>
      <Logo>
        <LogoKicker>Twoja własna</LogoKicker>
        <LogoWord>
          mapa p<LogoDot />
          dróży
        </LogoWord>
      </Logo>
      <Tabs>
        <Tab type="button" $active={tab === "map"} onClick={() => onTab("map")}>
          Mapa
        </Tab>
        <Tab type="button" $active={tab === "stats"} onClick={() => onTab("stats")}>
          Statystyki
        </Tab>
        <Tab type="button" $active={tab === "profile"} onClick={() => onTab("profile")}>
          Profil
        </Tab>
      </Tabs>
      <Counter>
        <CounterItem>
          <strong>{visited}</strong>/ {total} krajów
        </CounterItem>
        <CounterItem>
          <strong>{cities}</strong> miast
        </CounterItem>
      </Counter>
    </Bar>
  );
}
