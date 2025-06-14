import styled, { css } from 'styled-components';

const Card = styled.div`
  background-color: ${props => props.theme.colors.cardBackground};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.radii.lg};
  padding: ${props => props.theme.spacing.lg};
  transition: all ${props => props.theme.transitions.fast};
  backdrop-filter: blur(10px);
  
  ${props => props.hover && css`
    cursor: pointer;
    
    &:hover {
      background-color: ${props.theme.colors.cardBackgroundHover};
      border-color: ${props.theme.colors.borderLight};
      transform: translateY(-2px);
      box-shadow: ${props.theme.shadows.lg};
    }
  `}
  
  ${props => props.variant === 'outlined' && css`
    background-color: transparent;
    border: 2px solid ${props.theme.colors.border};
  `}
  
  ${props => props.variant === 'elevated' && css`
    box-shadow: ${props.theme.shadows.md};
  `}
  
  ${props => props.size === 'sm' && css`
    padding: ${props.theme.spacing.md};
  `}
  
  ${props => props.size === 'lg' && css`
    padding: ${props.theme.spacing.xl};
  `}
`;

export const CardHeader = styled.div`
  margin-bottom: ${props => props.theme.spacing.md};
  
  h1, h2, h3, h4, h5, h6 {
    margin: 0 0 ${props => props.theme.spacing.sm} 0;
    color: ${props => props.theme.colors.text};
  }
`;

export const CardContent = styled.div`
  color: ${props => props.theme.colors.textSecondary};
  line-height: 1.6;
  
  p {
    margin: 0 0 ${props => props.theme.spacing.md} 0;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
`;

export const CardFooter = styled.div`
  margin-top: ${props => props.theme.spacing.md};
  padding-top: ${props => props.theme.spacing.md};
  border-top: 1px solid ${props => props.theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${props => props.theme.spacing.md};
`;

export default Card;