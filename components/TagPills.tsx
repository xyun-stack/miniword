"use client";

import Link from "next/link";
import { useState } from "react";

type TagItem = { tag: string; href: string };

type Props = {
  activeTag?: string;
  tags: TagItem[];
  anyHref: string;
};

const COLLAPSED_LIMIT = 10;

/**
 * TagPills — drill-down tag selector. Shows first N tags inline and
 * tucks the rest behind a "+N more" button so a long category like
 * Anime doesn't dominate the filter surface.
 */
export function TagPills({ activeTag, tags, anyHref }: Props) {
  const [expanded, setExpanded] = useState(false);
  const overflow = tags.length > COLLAPSED_LIMIT;
  const visible =
    !overflow || expanded ? tags : tags.slice(0, COLLAPSED_LIMIT);
  const more = tags.length - COLLAPSED_LIMIT;

  // If the active tag is hidden behind the collapse, force-expand so the
  // selected pill is always visible.
  const activeHidden =
    overflow &&
    !expanded &&
    activeTag !== undefined &&
    !visible.some((t) => t.tag === activeTag);
  if (activeHidden) {
    return (
      <ExpandedView
        activeTag={activeTag}
        tags={tags}
        anyHref={anyHref}
        onCollapse={() => setExpanded(false)}
        canCollapse={false}
      />
    );
  }

  return (
    <>
      <Link href={anyHref} className="pill" data-active={!activeTag}>
        Any
      </Link>
      {visible.map((t) => (
        <Link
          key={t.tag}
          href={t.href}
          className="pill"
          data-active={activeTag === t.tag}
        >
          #{t.tag}
        </Link>
      ))}
      {overflow && !expanded && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="pill"
          aria-expanded="false"
        >
          + {more} more
        </button>
      )}
      {overflow && expanded && (
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="pill"
          aria-expanded="true"
        >
          Show less
        </button>
      )}
    </>
  );
}

function ExpandedView({
  activeTag,
  tags,
  anyHref,
  onCollapse,
  canCollapse
}: Props & { onCollapse: () => void; canCollapse: boolean }) {
  return (
    <>
      <Link href={anyHref} className="pill" data-active={!activeTag}>
        Any
      </Link>
      {tags.map((t) => (
        <Link
          key={t.tag}
          href={t.href}
          className="pill"
          data-active={activeTag === t.tag}
        >
          #{t.tag}
        </Link>
      ))}
      {canCollapse && (
        <button type="button" onClick={onCollapse} className="pill">
          Show less
        </button>
      )}
    </>
  );
}
