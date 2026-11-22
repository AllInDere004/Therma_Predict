import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./ChatMarkdown.css";

const plugins = [remarkGfm];

function safeUrl(url) {
  if (url.startsWith("#") || /^https?:[/][/]/i.test(url)) return url;
  return "";
}

const components = {
  a: ({ href, children }) => {
    if (!href) return <span>{children}</span>;
    if (href.startsWith("#")) return <a href={href}>{children}</a>;
    return <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>;
  },
  pre: ({ children }) => <pre tabIndex={0} role="region" aria-label="Code block">{children}</pre>,
  table: ({ children }) => (
    <div className="chat-markdown-table" tabIndex={0} role="region" aria-label="Markdown table">
      <table>{children}</table>
    </div>
  ),
};

export default function ChatMarkdown({ content }) {
  return (
    <div className="chat-markdown">
      <Markdown
        remarkPlugins={plugins}
        components={components}
        urlTransform={safeUrl}
        disallowedElements={["img"]}
        skipHtml
      >
        {content}
      </Markdown>
    </div>
  );
}
