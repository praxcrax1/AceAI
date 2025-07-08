// Document model for MongoDB (Mongoose-style, but using native driver)

class Document {
  constructor({
    _id,
    userId,
    filename,
    cloudinaryUrl,
    fileId,
    pageCount,
    chunksCount,
    createdAt,
    updatedAt,
    processedAt,
    ...rest
  }) {
    this._id = _id;
    this.userId = userId;
    this.filename = filename;
    this.cloudinaryUrl = cloudinaryUrl;
    this.fileId = fileId;
    this.pageCount = pageCount;
    this.chunksCount = chunksCount;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.processedAt = processedAt;
    Object.assign(this, rest); // for tags, title, etc.
  }

  static fromDocument(doc) {
    return new Document(doc);
  }

  toDocument() {
    return {
      _id: this._id,
      userId: this.userId,
      filename: this.filename,
      cloudinaryUrl: this.cloudinaryUrl,
      fileId: this.fileId,
      pageCount: this.pageCount,
      chunksCount: this.chunksCount,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      processedAt: this.processedAt,
      // ...other fields
    };
  }
}

module.exports = Document;
