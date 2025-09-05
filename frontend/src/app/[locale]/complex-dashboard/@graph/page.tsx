async function GraphPage() {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return <h1>This is graph page.</h1>;
}

export default GraphPage;
