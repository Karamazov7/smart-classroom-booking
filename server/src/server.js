import 'dotenv/config'; // must stay the first import
import app from './app.js';

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));