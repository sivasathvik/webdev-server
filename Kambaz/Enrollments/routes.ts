import EnrollmentsDao from "./dao";
export default function EnrollmentRoutes(app, db) {
  const dao = EnrollmentsDao(db);
  // "current" in the path means the signed-in user from the session
  const resolveUserId = (req, res) => {
    let { userId } = req.params;
    if (userId === "current") {
      const currentUser = req.session["currentUser"];
      if (!currentUser) {
        res.sendStatus(401);
        return null;
      }
      userId = currentUser._id;
    }
    return userId;
  };
  // ---- callbacks ----
  const findAllEnrollments = (req, res) => {
    res.json(dao.findAllEnrollments());
  };
  const enrollUserInCourse = (req, res) => {
    const userId = resolveUserId(req, res);
    if (!userId) return;
    res.json(dao.enrollUserInCourse(userId, req.params.courseId));
  };
  const unenrollUserFromCourse = (req, res) => {
    const userId = resolveUserId(req, res);
    if (!userId) return;
    dao.unenrollUserFromCourse(userId, req.params.courseId);
    res.sendStatus(200);
  };
  // ---- routes ----
  app.get("/api/enrollments", findAllEnrollments);
  app.post("/api/users/:userId/courses/:courseId", enrollUserInCourse);
  app.delete("/api/users/:userId/courses/:courseId", unenrollUserFromCourse);
}
