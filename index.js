const app = require("./src/server/server");
const { PORT } = require("./src/config/env");

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
