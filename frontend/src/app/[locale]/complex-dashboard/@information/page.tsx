async function InformationPage() {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return <h1>This is information page.</h1>;
}

export default InformationPage;
