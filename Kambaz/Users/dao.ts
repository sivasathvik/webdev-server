import { v4 as uuidv4 } from "uuid";
export default function UsersDao(db) {
  let { users } = db;
  const createUser = (user) => {
    const newUser = { ...user, _id: uuidv4() };
    users = [...users, newUser];
    return newUser;
  };
  const findAllUsers = () => users;
  const findUserByUsername = (username) =>
    users.find((user) => user.username === username);
  const findUserByCredentials = (username, password) =>
    users.find((user) => user.username === username && user.password === password);
  const findUserById = (userId) =>
    users.find((user) => user._id === userId);
  const updateUser = (userId, user) =>
    (users = users.map((u) => (u._id === userId ? user : u)));
  const deleteUser = (userId) =>
    (users = users.filter((u) => u._id !== userId));
  // People table: users with an enrollment in the course
  const findUsersForCourse = (courseId) =>
    users.filter((user) =>
      db.enrollments.some((e) => e.user === user._id && e.course === courseId),
    );
  return {
    createUser,
    findAllUsers,
    findUserByUsername,
    findUserByCredentials,
    findUserById,
    updateUser,
    deleteUser,
    findUsersForCourse,
  };
}
