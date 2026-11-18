import UsersDao from "./dao";
import EnrollmentsDao from "../Enrollments/dao";
export default function UserRoutes(app, db) {
  const dao = UsersDao(db);
  const enrollmentsDao = EnrollmentsDao(db);
  // ---- auth callbacks ----
  const signup = (req, res) => {
    const user = dao.findUserByUsername(req.body.username);
    if (user) {
      res.status(400).json({ message: "Username already in use" });
      return;
    }
    const currentUser = dao.createUser(req.body);
    req.session["currentUser"] = currentUser;
    res.json(currentUser);
  };
  const signin = (req, res) => {
    const { username, password } = req.body;
    const currentUser = dao.findUserByCredentials(username, password);
    if (currentUser) {
      req.session["currentUser"] = currentUser;
      res.json(currentUser);
    } else {
      res.status(401).json({ message: "Unable to login. Try again later." });
    }
  };
  const signout = (req, res) => {
    req.session.destroy();
    res.sendStatus(200);
  };
  const profile = (req, res) => {
    const currentUser = req.session["currentUser"];
    if (!currentUser) {
      res.sendStatus(401);
      return;
    }
    res.json(currentUser);
  };
  const updateUser = (req, res) => {
    const userId = req.params.userId;
    const userUpdates = req.body;
    dao.updateUser(userId, userUpdates);
    const updated = dao.findUserById(userId);
    // keep the session in sync only when you edit yourself
    // (faculty editing someone else in People must not become that user)
    const currentUser = req.session["currentUser"];
    if (currentUser && currentUser._id === userId) {
      req.session["currentUser"] = updated;
    }
    res.json(updated);
  };

  // ---- People table (5.4.9) ----
  const isFaculty = (req) => {
    const role = req.session["currentUser"]?.role;
    return role === "FACULTY" || role === "ADMIN";
  };
  const findUsersForCourse = (req, res) => {
    res.json(dao.findUsersForCourse(req.params.courseId));
  };
  const createUserForCourse = (req, res) => {
    if (!isFaculty(req)) {
      res.status(403).json({ message: "Only faculty can add people" });
      return;
    }
    const newUser = dao.createUser(req.body);
    enrollmentsDao.enrollUserInCourse(newUser._id, req.params.courseId);
    res.json(newUser);
  };
  const deleteUser = (req, res) => {
    if (!isFaculty(req)) {
      res.status(403).json({ message: "Only faculty can delete people" });
      return;
    }
    dao.deleteUser(req.params.userId);
    res.sendStatus(200);
  };

  // ---- routes ----
  app.post("/api/users/signup", signup);
  app.post("/api/users/signin", signin);
  app.post("/api/users/signout", signout);
  app.get("/api/users/profile", profile);
  app.put("/api/users/:userId", updateUser);
  app.delete("/api/users/:userId", deleteUser);
  app.get("/api/courses/:courseId/users", findUsersForCourse);
  app.post("/api/courses/:courseId/users", createUserForCourse);
}
