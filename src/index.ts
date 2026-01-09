import { app } from "./app";

app.get("/", (req, res) => {
  res.send("World!");
});

app.get("/test", (req, res) => {
  let name = "Prakhar";
  res.send({ name });
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
