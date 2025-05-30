class APIFeatures {
    constructor(mongooseQuery, queryString) {
      this.mongooseQuery = mongooseQuery;
      this.queryString = queryString;
    }
  
    filter() {
      const queryStringObj = { ...this.queryString };
      const excludeFields = ["page", "limit", "sort", "fields", "keyword"];
      excludeFields.forEach((el) => delete queryStringObj[el]);
      let queryString = JSON.stringify(queryStringObj);
      queryString = queryString.replace(
        /\b(gt|gte|lt|lte|in)\b/g,
        (match) => `$${match}`
      );
      this.mongooseQuery = this.mongooseQuery.find(JSON.parse(queryString));
      return this;
    }
  
    sort() {
      if (this.queryString.sort) {
        const sortBy = this.queryString.sort.replace(",", " ");
        this.mongooseQuery = this.mongooseQuery.sort(sortBy);
      } else {
        this.mongooseQuery = this.mongooseQuery.sort("-createdAt");
      }
      return this;
    }
  
    limitFields() {
      if (this.queryString.fields) {
        const fields = this.queryString.fields.split(",").join(" ");
        this.mongooseQuery = this.mongooseQuery.select(fields);
      } else {
        this.mongooseQuery = this.mongooseQuery.select("-__v");
      }
      return this;
    }
  
    pagination(countDocument) {
      const page = this.queryString.page * 1 || 1;
      const limit = this.queryString.limit * 1 || 15;
      const skip = (page - 1) * limit;
      const endIndex = page * limit;
      // pagination result
      const pagination = {};
  
      pagination.currentPage = page;
      pagination.limit = limit;
      pagination.numberOfPages = Math.ceil(countDocument / limit);
      if (endIndex < countDocument) {
        pagination.next = page + 1;
      }
      if (skip > 0) {
        pagination.prev = page - 1;
      }
  
      this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit);
      this.paginationResult = pagination;
      return this;
    }
  
    search() {
      if (this.queryString.keyword) {
        this.mongooseQuery = this.mongooseQuery.find({
          $or: [
            { title: { $regex: this.queryString.keyword, $options: "i" } },
            { description: { $regex: this.queryString.keyword, $options: "i" } },
            { _id : { $regex: this.queryString.keyword, $options: "i" } }
          ]
        });
      }
      return this;
    }
  }
  
  module.exports = APIFeatures;