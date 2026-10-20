import React from 'react';
import styled from 'styled-components';
import { usePublisherDiscovery } from '../../contexts/PublisherDiscoveryContext';
import { DEFAULT_PUBLISHER_PUBKEYS, DEFAULT_TOLLGATE_PUBKEY, CI_PUBLISHER_PUBKEY } from '../../constants';
import Button from '../common/Button';

const PublisherSelector = () => {
  const { publishers, selectedPubkeys, togglePublisher, selectAll, clearAll, discoveryLoading } = usePublisherDiscovery();

  const publisherName = (pubkey) =>
    pubkey === DEFAULT_TOLLGATE_PUBKEY ? 'TollGate (Official, GitHub-era)'
      : pubkey === CI_PUBLISHER_PUBKEY ? 'TollGate CI (ngit release lane)'
        : null;

  // Official keys first, in declared order; then discovered publishers.
  const officialRows = DEFAULT_PUBLISHER_PUBKEYS
    .filter((k) => !publishers.some((p) => p.pubkey === k))
    .map((k) => ({ pubkey: k, name: publisherName(k), lastSeen: null }));
  const rows = [
    ...DEFAULT_PUBLISHER_PUBKEYS
      .map((k) => publishers.find((p) => p.pubkey === k))
      .filter(Boolean),
    ...officialRows,
    ...publishers.filter((p) => !DEFAULT_PUBLISHER_PUBKEYS.includes(p.pubkey))
  ];

  return (
    <Container>
      <Header>
        <Title>Publishers</Title>
        <Actions>
          <Button variant="secondary" size="small" onClick={selectAll}>All</Button>
          <Button variant="secondary" size="small" onClick={clearAll}>Reset</Button>
        </Actions>
      </Header>
      <Hint>
        {discoveryLoading
          ? 'Scanning relays for tagged publishers…'
          : publishers.length === 0
            ? 'No third-party publishers found yet — showing the official publisher.'
            : `${publishers.length} publisher${publishers.length === 1 ? '' : 's'} publishing the tollgate tag`}
      </Hint>
      <List>
        {rows.map((p) => {
          const checked = selectedPubkeys.includes(p.pubkey);
          return (
            <Row key={p.pubkey} $checked={checked}>
              <Checkbox
                type="checkbox"
                checked={checked}
                onChange={() => togglePublisher(p.pubkey)}
                id={`pub-${p.pubkey.slice(0, 12)}`}
              />
              <Label htmlFor={`pub-${p.pubkey.slice(0, 12)}`}>
                <Name>{publisherName(p.pubkey) || (p.name || `${p.pubkey.slice(0, 16)}…`)}</Name>
                <Key>{p.pubkey.slice(0, 24)}…</Key>
              </Label>
            </Row>
          );
        })}
      </List>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 1rem;
`;

const Actions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const Hint = styled.p`
  margin: 0;
  font-size: 0.8rem;
  opacity: 0.7;
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  max-height: 300px;
  overflow-y: auto;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.5rem;
  border-radius: 4px;
  background: ${(props) => (props.$checked ? 'rgba(255,255,255,0.06)' : 'transparent')};
`;

const Checkbox = styled.input`
  cursor: pointer;
`;

const Label = styled.label`
  display: flex;
  flex-direction: column;
  cursor: pointer;
  flex: 1;
`;

const Name = styled.span`
  font-size: 0.9rem;
`;

const Key = styled.span`
  font-size: 0.7rem;
  opacity: 0.6;
  font-family: monospace;
`;

export default PublisherSelector;
