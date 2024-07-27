import Link from "next/link";
import { ReactNode } from "react";
import { LinkIt, LinkItUrl } from "react-linkify-it";
import UserToolTip from "./UserToltip";
import UserLinkWithTooltip from "./UserLinkWithTooltip";
interface Props {
  children: ReactNode;
}

export default function Linkfy({ children }: Props) {
  return (
    <LinkifyUsername>
      <LinkfyHastag>
        <LinkItUrl>{children}</LinkItUrl>
      </LinkfyHastag>
    </LinkifyUsername>
  );
}

function LinkfyUrl({ children }: Props) {
  return (
    <LinkItUrl className="text-primary  hover:underline">{children}</LinkItUrl>
  );
}

function LinkifyUsername({ children }: Props) {
  return (
    <LinkIt
      regex={/(@[a-zA-z0-9_-]+)/}
      component={(match, key) => (
        <UserLinkWithTooltip name={match.slice(1)} key={key}>
          {match}
        </UserLinkWithTooltip>
      )}
    >
      {children}
    </LinkIt>
  );
}

function LinkfyHastag({ children }: Props) {
  return (
    <LinkIt
      regex={/(#[a-zA-z0-9_-]+)/}
      component={(match, key) => (
        <Link
          href={`/hastag/${match.slice(1)}`}
          key={key}
          className="text-blue-800 hover:underline"
        >
          {match}
        </Link>
      )}
    >
      {children}
    </LinkIt>
  );
}
