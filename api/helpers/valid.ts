import { check, body } from "express-validator";
import { NamaDesa } from "@prisma/client";


// export const validSign = []

export const validSign = [
    check('email', 'email is required').notEmpty(),
    check('email')
        .isEmail()
        .withMessage('Must be a valid email address'),
    check('password', 'password is required').notEmpty(),
    check('password')
        .isLength({ min: 8 }).withMessage('Password must contain at least 8 characters')
        .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z-_!@#$%^&*]{8,}$/, "i").withMessage('Password should contain at least 1 uppercase, 1 lowercase, and 1 numeric'),
    check("confirmPassword")
        .notEmpty().withMessage("Confirm Password should not be empty")
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Password confirmation does not match with password')
            }
            return true;
        }),
]

exports.validLogin = [
    check('email')
        .isEmail()
        .withMessage('Must be a valid email address'),
    check('password', 'password is required').notEmpty(),
]

exports.forgotPasswordValidator = [
    check('email')
        .not()
        .isEmpty()
        .isEmail()
        .withMessage('Must be a valid email address')
]

exports.resetPasswordValidator = [
    check('newPassword')
        .not()
        .isEmpty()
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z-_!@#$%^&*]{8,}$/, "i").withMessage('Password should contain at least 1 uppercase, 1 lowercase, and 1 numeric'),
    check("confirmPassword")
        .notEmpty().withMessage("Confirm Password should not be empty")
        .custom((value, { req }) => {
            if (value !== req.body.newPassword) {
                throw new Error('Password confirmation does not match with password')
            }
            return true;
        }),
]

export const validateCreateNews = [
  body("judul")
    .trim()
    .notEmpty().withMessage("Judul tidak boleh kosong")
    .isLength({ min: 5 }).withMessage("Judul minimal 5 karakter"),

  body("isi")
    .trim()
    .notEmpty().withMessage("Isi berita tidak boleh kosong")
    .isLength({ min: 10 }).withMessage("Isi berita minimal 10 karakter"),

  body("gambarUrl")
    .optional()
    .isURL().withMessage("gambarUrl harus berupa URL yang valid"),

  body("desa")
    .notEmpty().withMessage("Desa tidak boleh kosong")
    .isIn(Object.values(NamaDesa)).withMessage("Desa tidak valid"),
];

export const validateNewsInput = [
  body("judul")
    .trim()
    .notEmpty().withMessage("Judul tidak boleh kosong")
    .isLength({ min: 5 }).withMessage("Judul minimal 5 karakter"),

  body("isi")
    .trim()
    .notEmpty().withMessage("Isi berita tidak boleh kosong")
    .isLength({ min: 10 }).withMessage("Isi berita minimal 10 karakter"),

  body("gambarUrl")
    .optional()
    .isURL().withMessage("URL gambar tidak valid"),
];
