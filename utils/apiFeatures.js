class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    // Tạo một object để lưu trữ các thuộc tính được chọn
    let queryObj = { ...this.queryString };
    // Các thuộc tính cần lọc bỏ, do không phải là các thuộc tính của model
    const excludedFields = ['page', 'sort', 'limit', 'fields'];

    // Loại bỏ các thuộc tính không phải là các thuộc tính của model khỏi object queryObj
    excludedFields.forEach((field) => delete queryObj[field]);

    // Duyệt qua các thuộc tính còn lại trong queryObj và thêm vào object projection
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    queryObj = JSON.parse(queryStr);

    return this;
  }

  sort() {
    //2 sorting
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  limitFields() {
    //3 fields limit
    if (this.query.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  paginate() {
    //4 paginations per
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 8;
    const skip = (page - 1) * limit;
    //if limit = 10 - page 1 : 0-9, page 2 =  10 -19
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIFeatures;
