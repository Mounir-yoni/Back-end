const mongoose = require("mongoose");
const slugify = require("slugify");

const voyageSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Voyage title is required"],
        trim: true,
        unique: true,
        minlength: [3, "Le nom doit contenir au moins 3 caractères"],
        maxlength: 100,
    },
    description: {
        type: String,
        required: [true, "Voyage description is required"],
    },
    prix: {
        type: Number,
        required: [true, "Price is required"],
        min: [0, "Price cannot be negative"],
    },
    date_de_depart: {
        type: Date,
        required: [true, "Start date is required"],
    },
    date_de_retour: {
        type: Date,
        required: [true, "End date is required"],
        validate: {
            validator: function(value) {
                return value > this.date_de_depart;
            },
            message: "La date de retour doit être après la date de départ"
        }
    },
    duree: {
        type: Number,
        required: [true, "Duration is required"],
        min: [1, "Duration must be at least 1 day"],
    },
    destination: {
        type: String,
        required: [true, "Destination is required"],
    },
    image: {
        type: String,
        required: [true, "Voyage image is required"],
    },
    imagePath: {
        type: String,
    },
    ville: {
        type: [String],
        required: true,
    },
    pays: {
        type: String,
        required: true,
    },
    nombre_de_personne: {
        type: Number,
        required: true,
    },
    nombre_de_personne_reserve: {
        type: Number,
        required: true,
        default: 0,
    },
    remaining_places: {
        type: Number,
        required: true,
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
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
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
voyageSchema.index({ destination: 1, date_de_depart: 1 });

const Voyage = mongoose.model("Voyage", voyageSchema);

module.exports = Voyage;