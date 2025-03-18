// import {Model } from "mongoose";


// export default class Dao<T extends Model<any>> {
//   /**
//    * User Model.
//    * @param {T} model Any database model
//    */
//   public model:T;

//   /**
//    * Constructor
//    * @param {T} model Any database model
//    */
//   constructor(model: T) {
//     this.model = model;
//   }

//   // /**
//   //  * Get Document By Id.
//   //  * @param {ObjectId} id id of the document.
//   //  * @returns {Promise<Document>} document
//   //  */
//   // public async findById(id: ObjectId): Promise<Document | null> {
//   //   return this.model.findById(id);
//   // }

//   // public async findOne(queryObject: Object): Promise<Document | null> {
//   //   return this.model.findOne(queryObject);
//   // }

//   // public async find(queryObject: Object): Promise<Document[]> {
//   //   return this.model.find(queryObject);
//   // }

//   // public async findByIdAndUpdate(id: ObjectId, updateObject: Object, options: Object | undefined): Promise<Document | null> {
//   //   return this.model.findByIdAndUpdate(id, updateObject, options);
//   // }

//   // public async findOneAndUpdate(queryObject: Object, updateObject: Object, options: Object | undefined): Promise<Document | null> {
//   //   return this.model.findOneAndUpdate(queryObject, updateObject, options);
//   // }

//   // public async updateMany(queryObject: Object | undefined, updateObject: Object, options: Object | undefined): Promise<UpdateWriteOpResult> {
//   //   return this.model.updateMany(queryObject, updateObject, options);
//   // }

//   // public async findByIdAndDelete(id: ObjectId): Promise<Document | null> {
//   //   return this.model.findByIdAndDelete(id);
//   // }

//   // public async findOneAndDelete(queryObject: Object, options: Object | undefined): Promise<Document | null> {
//   //   return this.model.findOneAndDelete(queryObject, options);
//   // }

//   // public async deleteMany(queryObject: Object | undefined, options: Object | undefined): Promise<Object | null> {
//   //   return this.model.deleteMany(queryObject, options);
//   // }
// }
