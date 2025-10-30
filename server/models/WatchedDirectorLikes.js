module.exports = (sequelize, DataTypes) => {
  const WatchedDirectorLikes = sequelize.define("WatchedDirectorLikes", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    likeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    watchedDirectorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  })

  return WatchedDirectorLikes
}
