module.exports = (sequelize, DataTypes) => {
  const Likes = sequelize.define("Likes", {
    filmId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  })
  return Likes
}
