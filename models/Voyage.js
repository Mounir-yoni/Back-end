const mongoose = require("mongoose");
const slugify = require("slugify");

const voyageSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Voyage title is required"],
        trim: true,
        minlength: [3, "Title must be at least 3 characters long"],
        maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
        type: String,
        required: [true, "Voyage description is required"],
        trim: true,
    },
    prix: {
        type: Number,
        required: [true, "Price is required"],
        min: [0, "Price cannot be negative"],
    },
    date_de_depart: {
        type: Date,
        required: [true, "Departure date is required"],
    },
    date_de_retour: {
        type: Date,
        required: [true, "Return date is required"],
    },
    duree: {
        type: Number,
        required: [true, "Duration is required"],
        min: [1, "Duration must be at least 1 day"],
    },
    destination: {
        type: String,
        required: [true, "Destination is required"],
        trim: true,
    },
    image: {
        type: String,
        required: [true, "Image is required"],
    },
    imageId: {
        type: String,
        required: [true, "Image ID is required"],
    },
    ville: {
        type: String,
        required: [true, "City is required"],
        trim: true,
    },
    pays: {
        type: String,
        required: [true, "Country is required"],
        trim: true,
    },
    nombre_de_personne: {
        type: Number,
        required: [true, "Number of people is required"],
        min: [1, "Number of people must be at least 1"],
    },
    nombre_de_personne_reserve: {
        type: Number,
        required: true,
        default: 0,
    },
    remaining_places: {
        type: Number,
        default: function() {
            return this.nombre_de_personne;
        },
    },
    active: {
        type: Boolean,
        default: true,
    },
    status: {
        type: String,
        enum: ["active", "completed", "cancelled"],
        default: "active",
    },
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: [true, "Creator is required"],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

// Pre-save middleware to generate slug
voyageSchema.pre('save', function(next) {
    this.slug = slugify(this.title, { lower: true });
    next();
});

// Virtual for remaining places
voyageSchema.virtual('placesRestantes').get(function() {
    return this.nombre_de_personne - this.nombre_de_personne_reserve;
});

// Add index for better search performance
voyageSchema.index({ title: 'text', description: 'text', destination: 'text', ville: 'text', pays: 'text' });

// Virtual populate reservations
voyageSchema.virtual('reservations', {
    ref: 'Reservation',
    foreignField: 'voyage',
    localField: '_id'
});

const Voyage = mongoose.model("Voyage", voyageSchema);

module.exports = Voyage;