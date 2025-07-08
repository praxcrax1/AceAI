// User model for MongoDB (Mongoose-style, but using native driver)

class User {
  constructor({_id, email, password, createdAt, updatedAt}) {
    this._id = _id;
    this.email = email;
    this.password = password;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static fromDocument(doc) {
    return new User(doc);
  }

  toDocument() {
    return {
      _id: this._id,
      email: this.email,
      password: this.password,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

module.exports = User;
