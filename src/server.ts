import app from './routes'; // TODO: can this be better?
// import {} from 'swagger-ui-dist';

// const pathToSwaggerUi = swagg
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('listening on PORT %d', PORT);
});
