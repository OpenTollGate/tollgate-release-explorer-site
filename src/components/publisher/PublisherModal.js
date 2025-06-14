import React, { useState } from 'react';
import styled from 'styled-components';
import { useNostrReleases } from '../../contexts/NostrReleaseContext';
import { DEFAULT_TOLLGATE_PUBKEY } from '../../constants';
import Button from '../common/Button';

const PublisherModal = ({ onClose }) => {
  const { currentPubkey, setCurrentPubkey } = useNostrReleases();
  const [inputPubkey, setInputPubkey] = useState(currentPubkey);
  const [error, setError] = useState('');

  const validatePubkey = (pubkey) => {
    if (!pubkey) return false;
    // Basic validation: should be 64 character hex string
    return /^[0-9a-fA-F]{64}$/.test(pubkey);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const trimmedPubkey = inputPubkey.trim();
    
    if (!validatePubkey(trimmedPubkey)) {
      setError('Invalid pubkey format. Must be 64 character hex string.');
      return;
    }

    setCurrentPubkey(trimmedPubkey);
    onClose();
  };

  const handleReset = () => {
    setInputPubkey(DEFAULT_TOLLGATE_PUBKEY);
    setError('');
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Switch Publisher</ModalTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>

        <ModalBody>
          <Description>
            Enter a Nostr public key to browse releases from a different publisher.
            The default publisher is the official TollGate pubkey.
          </Description>

          <form onSubmit={handleSubmit}>
            <FormGroup>
              <Label htmlFor="pubkey">Publisher Public Key</Label>
              <PubkeyInput
                id="pubkey"
                type="text"
                value={inputPubkey}
                onChange={(e) => setInputPubkey(e.target.value)}
                placeholder="Enter 64-character hex pubkey..."
                $hasError={!!error}
              />
              {error && <ErrorMessage>{error}</ErrorMessage>}
            </FormGroup>

            <CurrentInfo>
              <InfoLabel>Current Publisher:</InfoLabel>
              <InfoValue>
                {currentPubkey === DEFAULT_TOLLGATE_PUBKEY 
                  ? 'TollGate (Official)' 
                  : `${currentPubkey.slice(0, 16)}...${currentPubkey.slice(-16)}`
                }
              </InfoValue>
            </CurrentInfo>

            <ButtonGroup>
              <Button 
                type="button" 
                variant="secondary" 
                onClick={handleReset}
              >
                Reset to Default
              </Button>
              <Button type="submit" variant="primary">
                Switch Publisher
              </Button>
            </ButtonGroup>
          </form>
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  );
};

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: ${props => props.theme.spacing.lg};
`;

const ModalContent = styled.div`
  background-color: ${props => props.theme.colors.backgroundSecondary};
  border-radius: ${props => props.theme.radii.lg};
  border: 1px solid ${props => props.theme.colors.border};
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: ${props => props.theme.shadows.xl};
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${props => props.theme.spacing.lg};
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: ${props => props.theme.fontSizes.xl};
  font-weight: ${props => props.theme.fontWeights.semibold};
  color: ${props => props.theme.colors.text};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: ${props => props.theme.fontSizes['2xl']};
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: ${props => props.theme.radii.md};
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    background-color: ${props => props.theme.colors.cardBackground};
    color: ${props => props.theme.colors.text};
  }
`;

const ModalBody = styled.div`
  padding: ${props => props.theme.spacing.lg};
`;

const Description = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  margin: 0 0 ${props => props.theme.spacing.lg} 0;
  line-height: 1.6;
`;

const FormGroup = styled.div`
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const Label = styled.label`
  display: block;
  margin-bottom: ${props => props.theme.spacing.sm};
  font-weight: ${props => props.theme.fontWeights.medium};
  color: ${props => props.theme.colors.text};
`;

const PubkeyInput = styled.input`
  width: 100%;
  padding: ${props => props.theme.spacing.md};
  background-color: ${props => props.theme.colors.cardBackground};
  border: 1px solid ${props => props.$hasError ? props.theme.colors.error : props.theme.colors.border};
  border-radius: ${props => props.theme.radii.md};
  color: ${props => props.theme.colors.text};
  font-family: monospace;
  font-size: ${props => props.theme.fontSizes.sm};
  transition: border-color ${props => props.theme.transitions.fast};

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }

  &::placeholder {
    color: ${props => props.theme.colors.textMuted};
  }
`;

const ErrorMessage = styled.span`
  color: ${props => props.theme.colors.error};
  font-size: ${props => props.theme.fontSizes.sm};
  margin-top: ${props => props.theme.spacing.xs};
  display: block;
`;

const CurrentInfo = styled.div`
  background-color: ${props => props.theme.colors.cardBackground};
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.radii.md};
  margin-bottom: ${props => props.theme.spacing.lg};
`;

const InfoLabel = styled.div`
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: ${props => props.theme.spacing.xs};
`;

const InfoValue = styled.div`
  font-family: monospace;
  font-size: ${props => props.theme.fontSizes.sm};
  color: ${props => props.theme.colors.text};
  word-break: break-all;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${props => props.theme.spacing.md};
  justify-content: flex-end;

  @media (max-width: ${props => props.theme.breakpoints.sm}) {
    flex-direction: column;
  }
`;

export default PublisherModal;