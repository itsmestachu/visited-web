import styled from "styled-components";

export const SettingLabel = styled.label`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
  font-size: 14px;
  font-weight: 600;

  strong {
    font-weight: 800;
  }
`;

export const Slider = styled.input`
  width: 100%;
  accent-color: ${({ theme }) => theme.colors.red};
  cursor: pointer;
`;

export const Ticks = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: ${({ theme }) => theme.colors.inkSoft};
`;

export const Identity = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
`;

export const AvatarButton = styled.button`
  position: relative;
  flex: none;
  padding: 0;
  border: 0;
  background: none;

  svg {
    position: absolute;
    right: -2px;
    bottom: -2px;
    box-sizing: content-box;
    padding: 4px;
    border: 1.5px solid ${({ theme }) => theme.colors.ink};
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.paper};
  }
`;

export const IdentityText = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const IdentityName = styled.span<{ $empty: boolean }>`
  font-family: ${({ theme }) => theme.fonts.serif};
  font-size: 22px;
  line-height: 1.1;
  overflow-wrap: anywhere;
  color: ${({ $empty, theme }) => ($empty ? theme.colors.inkSoft : theme.colors.ink)};
`;

export const IdentityBio = styled.span<{ $empty: boolean }>`
  font-family: ${({ theme }) => theme.fonts.hand};
  font-size: 19px;
  line-height: 1.1;
  overflow-wrap: anywhere;
  color: ${({ theme }) => theme.colors.inkSoft};
  opacity: ${({ $empty }) => ($empty ? 0.7 : 1)};
`;

export const AvatarPreview = styled.div`
  width: 64px;
  height: 64px;
  flex: none;
  overflow: hidden;
  border: 2px dashed ${({ theme }) => theme.colors.red};
  border-radius: 50%;
  padding: 3px;

  img,
  span {
    display: grid;
    place-items: center;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
    background: ${({ theme }) => theme.colors.mustard};
    font-family: ${({ theme }) => theme.fonts.serif};
    font-size: 26px;
  }
`;

export const SoonBadge = styled.span`
  align-self: flex-start;
  padding: 2px 8px;
  border: 1.5px dashed ${({ theme }) => theme.colors.inkSoft};
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.inkSoft};
`;
