exports.receiveMessage = (req, res) => {
  // Handle receiving and storing messages
  const { message } = req.body;
  console.log("Received message:", message);
  res.sendStatus(200);
};