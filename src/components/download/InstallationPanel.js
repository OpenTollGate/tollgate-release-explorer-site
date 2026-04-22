import React from "react";
import styled from "styled-components";

/**
 * Shared installation-instructions panel used by both the Package
 * (ipk/apk) and OS (firmware) download pages. Shows two command
 * alternatives: run on the router directly, or drive it from a local
 * computer. Honours a variant selection made elsewhere on the page —
 * when no variant is picked, filenames render as a placeholder.
 *
 * @param {Object} props
 * @param {'ipk' | 'apk' | 'firmware'} props.kind
 * @param {string} props.filename - Filename for the install commands.
 *   If no variant is selected the caller passes a
 *   '[sha256-hash].<ext>' placeholder.
 * @param {?string} props.downloadUrl - URL to fetch on the router /
 *   locally. `null` renders '<url>' as a placeholder.
 * @param {?string} props.selectedLabel - Label for the picked variant
 *   (arch for packages, device id for firmware). `null` when none.
 * @param {?function} props.onClearSelection - Callback that unsets
 *   the selection. When provided alongside `selectedLabel`, an inline
 *   "clear selection" link is shown.
 */
const InstallationPanel = ({
  kind,
  filename,
  downloadUrl,
  selectedLabel,
  onClearSelection,
}) => {
  const srcUrl = downloadUrl || "<url>";
  const spec = INSTALL_SPECS[kind];

  return (
    <>
      {selectedLabel ? (
        <InstallHint>
          Commands below target <strong>{selectedLabel}</strong>
          {onClearSelection && (
            <>
              {" "}
              <InlineLink onClick={onClearSelection}>
                clear selection
              </InlineLink>
            </>
          )}
        </InstallHint>
      ) : (
        <InstallHint>
          Showing a placeholder filename. Expand {spec.pickHint} below and
          press <em>Fill install ↑</em> to fill in the real URL and hash.
        </InstallHint>
      )}

      <InstallPickOne>Pick one of the two methods below:</InstallPickOne>

      <InstallBlocks>
        <InstallBlock>
          <InstallBlockTitle>Option A · On the router</InstallBlockTitle>
          <Terminal>
            <TerminalLine>cd /tmp && wget {srcUrl}</TerminalLine>
            <TerminalLine>{spec.installCmd(filename)}</TerminalLine>
            {spec.trailingComment && (
              <TerminalComment>{spec.trailingComment}</TerminalComment>
            )}
          </Terminal>
        </InstallBlock>

        <InstallOrDivider>
          <span>or</span>
        </InstallOrDivider>

        <InstallBlock>
          <InstallBlockTitle>Option B · From your computer</InstallBlockTitle>
          <Terminal>
            <TerminalLine>curl -L -o {filename} {srcUrl}</TerminalLine>
            <TerminalLine>scp -O {filename} root@192.168.1.1:/tmp/</TerminalLine>
            <TerminalLine>
              ssh root@192.168.1.1 '{spec.installCmd(filename)}'
            </TerminalLine>
            {spec.trailingComment && (
              <TerminalComment>{spec.trailingComment}</TerminalComment>
            )}
          </Terminal>
          <InstallNote>
            <Code>-O</Code> is required on macOS/modern OpenSSH — OpenWrt has
            no <Code>sftp-server</Code>.
            {spec.extraNote && <> {spec.extraNote}</>}
          </InstallNote>
        </InstallBlock>
      </InstallBlocks>
    </>
  );
};

// --- small reusable bit used in kind specs ---------------------------------
// Declared ahead of INSTALL_SPECS because that constant is evaluated at
// module load and references <Code> in its JSX; a forward reference would
// hit the temporal dead zone.

const Code = styled.code`
  display: inline-block;
  padding: 1px 5px;
  font-family: monospace;
  font-size: ${(props) => props.theme.fontSizes.xs};
  background-color: ${(props) => props.theme.colors.background};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.radii.sm};
`;

// --- kind-specific command recipes ------------------------------------------

const INSTALL_SPECS = {
  ipk: {
    pickHint: "an architecture",
    installCmd: (filename) => `opkg install /tmp/${filename}`,
    trailingComment: null,
    extraNote: null,
  },
  apk: {
    pickHint: "an architecture",
    installCmd: (filename) => `apk add --allow-untrusted /tmp/${filename}`,
    trailingComment: "# --allow-untrusted: our packages aren't signed yet",
    extraNote: null,
  },
  firmware: {
    pickHint: "a device",
    installCmd: (filename) => `sysupgrade /tmp/${filename}`,
    trailingComment: "# router will reboot — your ssh/http session will drop",
    extraNote: (
      <>
        Or skip the CLI entirely: in LuCI go to{" "}
        <Code>System → Backup / Flash Firmware → Flash new firmware image</Code>
        {" "}and upload the file directly.
      </>
    ),
  },
};

// --- styles ------------------------------------------------------------------

const InstallHint = styled.p`
  margin: 0 0 ${(props) => props.theme.spacing.md} 0;
  font-size: ${(props) => props.theme.fontSizes.sm};
  color: ${(props) => props.theme.colors.textSecondary};
  line-height: 1.5;
`;

const InlineLink = styled.button`
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  color: ${(props) => props.theme.colors.primary};
  cursor: pointer;
  text-decoration: underline;
`;

const InstallPickOne = styled.div`
  margin: 0 0 ${(props) => props.theme.spacing.md} 0;
  font-size: ${(props) => props.theme.fontSizes.sm};
  font-weight: ${(props) => props.theme.fontWeights.medium};
  color: ${(props) => props.theme.colors.text};
`;

const InstallBlocks = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.md};
`;

const InstallBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.sm};
  min-width: 0;
`;

const InstallBlockTitle = styled.h4`
  margin: 0;
  font-size: ${(props) => props.theme.fontSizes.sm};
  font-weight: ${(props) => props.theme.fontWeights.medium};
  color: ${(props) => props.theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const Terminal = styled.div`
  font-family: monospace;
  font-size: ${(props) => props.theme.fontSizes.sm};
  background-color: ${(props) => props.theme.colors.background};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.radii.md};
  padding: ${(props) => props.theme.spacing.md};
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing.xs};
  overflow-x: auto;
`;

const TerminalLine = styled.div`
  color: ${(props) => props.theme.colors.text};
  white-space: pre;
  word-break: keep-all;

  &::before {
    content: "$ ";
    color: ${(props) => props.theme.colors.textSecondary};
    user-select: none;
  }
`;

const TerminalComment = styled.div`
  color: ${(props) => props.theme.colors.textSecondary};
  white-space: pre;
  word-break: keep-all;
  opacity: 0.8;
`;

const InstallNote = styled.p`
  margin: 0;
  font-size: ${(props) => props.theme.fontSizes.xs};
  color: ${(props) => props.theme.colors.textSecondary};
  line-height: 1.5;
`;

const InstallOrDivider = styled.div`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing.sm};
  font-size: ${(props) => props.theme.fontSizes.xs};
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: ${(props) => props.theme.colors.textSecondary};

  span {
    flex: 0 0 auto;
    padding: 0 ${(props) => props.theme.spacing.sm};
  }

  &::before,
  &::after {
    content: "";
    flex: 1;
    height: 1px;
    background-color: ${(props) => props.theme.colors.border};
  }
`;

export default InstallationPanel;
