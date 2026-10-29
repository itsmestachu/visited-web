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

export const AvatarRow = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
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
