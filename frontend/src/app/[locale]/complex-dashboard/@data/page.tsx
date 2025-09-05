async function DataPage() {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return <h1>This is data page.</h1>;
}

export default DataPage;
