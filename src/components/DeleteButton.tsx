interface Props {
  onClick: () => void;
}

function DeleteButton(props: Props) {
  return (
    <button onClick={props.onClick} style={{ background: "red" }}>
      Delete
    </button>
  );
}

export default DeleteButton;
