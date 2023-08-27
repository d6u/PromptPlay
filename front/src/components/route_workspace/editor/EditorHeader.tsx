type ButtonItem = {
  title: string;
  onClick: () => void;
};

type Props = {
  title: string;
  buttonItems: ButtonItem[];
};

export default function EditorHeader({ title, buttonItems }: Props) {
  return (
    <div className="Editor_header">
      <h2 className="Editor_title">{title}</h2>
      <div className="Editor_header_button_group">
        {buttonItems.map((item) => (
          <button
            key={item.title}
            className="Editor_save-button"
            onClick={item.onClick}
          >
            {item.title}
          </button>
        ))}
      </div>
    </div>
  );
}
