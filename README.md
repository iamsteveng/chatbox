# chatbox

Proof of concept:
- Login and see who is online
- Broadcast message to all
- One to one private message
- Framework socket.io provide easy implementation of real time online chat

Problems to be solved:
- Chat history is not saved
- When server is restarted, all the chat history will be gone
- Single server is running now. How to make all the chat persistent on multiple servers?
- Need a better login mechanism
- The web view is not responsive. It is not user friendly on mobile
- Bug: It doesn't respond correctly if someone uses the same name as the others
- Bug: Can't scroll when there are too many messages
- Bug: In iPhone, when put Safari to background, the chat connection will be lost
