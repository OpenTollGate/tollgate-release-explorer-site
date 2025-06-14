import styled, { css } from 'styled-components';

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: none;
  border-radius: ${props => props.theme.radii.md};
  font-family: inherit;
  font-weight: ${props => props.theme.fontWeights.medium};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  text-decoration: none;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  ${props => {
    switch (props.variant) {
      case 'primary':
        return css`
          background-color: ${props.theme.colors.primary};
          color: white;
          
          &:hover:not(:disabled) {
            background-color: ${props.theme.colors.primaryDark};
            transform: translateY(-1px);
          }
          
          &:active:not(:disabled) {
            transform: translateY(0);
          }
        `;
      case 'secondary':
        return css`
          background-color: ${props.theme.colors.cardBackground};
          color: ${props.theme.colors.text};
          border: 1px solid ${props.theme.colors.border};
          
          &:hover:not(:disabled) {
            background-color: ${props.theme.colors.cardBackgroundHover};
            border-color: ${props.theme.colors.borderLight};
          }
        `;
      case 'outline':
        return css`
          background-color: transparent;
          color: ${props.theme.colors.text};
          border: 1px solid ${props.theme.colors.border};
          
          &:hover:not(:disabled) {
            background-color: ${props.theme.colors.cardBackground};
            border-color: ${props.theme.colors.primary};
          }
        `;
      case 'ghost':
        return css`
          background-color: transparent;
          color: ${props.theme.colors.textSecondary};
          
          &:hover:not(:disabled) {
            background-color: ${props.theme.colors.cardBackground};
            color: ${props.theme.colors.text};
          }
        `;
      default:
        return css`
          background-color: ${props.theme.colors.primary};
          color: white;
          
          &:hover:not(:disabled) {
            background-color: ${props.theme.colors.primaryDark};
          }
        `;
    }
  }}
  
  ${props => {
    switch (props.size) {
      case 'sm':
        return css`
          padding: 0.5rem 1rem;
          font-size: ${props.theme.fontSizes.sm};
        `;
      case 'lg':
        return css`
          padding: 0.75rem 2rem;
          font-size: ${props.theme.fontSizes.lg};
        `;
      default:
        return css`
          padding: 0.625rem 1.5rem;
          font-size: ${props.theme.fontSizes.md};
        `;
    }
  }}
  
  ${props => props.fullWidth && css`
    width: 100%;
  `}
`;

export default Button;