const admin = require("firebase-admin");

const config = {
  type: "service_account",
  project_id: "juncoffee-b2b2f",
  private_key_id: "74660d794db2cdc941ba0a6168ac8da550e014c7",
  private_key:
    "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCKimLRi1SyvnRY\nquNcalz8UBPYTBxn2H1ITKG+1GYzJXGKopv/a9dpmq5NwPuAV+6bolktDMY6D9HS\ny6besTzskyhO/HI8v0r7b80dCgcAE3onm+jHsAC1J0ClqkyTKbuWE/ZuTK/Sqfvu\nXwP4vrnsAXYLJy+9ZdN/MG99X6dvROQG5dGxfpUntvOlmE+Rin0OMzRjCrnBcE9O\nxUKrnvHPS89DtfVvO+VM28+LAQOXecwnup+NkSSNe7BNGIOy/V2KFklKWHjAUo1n\nczebbnXQ98V5W84Q7UoJ5Etut4A5sta7kEjmUK7qkx1mfvuHAd8GU/LICiZH9YGF\nSQWP3kUVAgMBAAECggEAHThD0FtZMVvvERZ13rOGSicfkGK5KQPlpJ6ZDLUimw3+\nLRXP3ibiJ6FauwaFZRPmvQeYVGKZ2nwkrpeKafSq22DMQyCGfZ6BE5gIhGPthwwU\nmw8MoTVTaOHPBkHtZaqLKIOsWaYt/Toh6yw6G7gqYYcLXR3WOVWlLnHKSgCnQVXQ\naCWNV2t7lkX5qsPYazLFgs9kXjaAlczamED1muXkqhzwQIc3J26ToBxX4I/hTZl5\n0b9t8duHprfkvz4XpiUprYC/ZRaUEO5opwGeR2cOHXryPYDZmW9NM5pH65AkPIAE\nDLbSl4VQfvyHvamQqCDN9oewLGTX7nWzAkhSOMVgzwKBgQC/t9MtWfXYraD5d8Re\nhg9JUgUMTgKQ7U+F1FEaRMc6jw9e1TPsFG7KmZWDs2kd5dZzHPhOtkNxlqlAVjbX\nMP4Wu6CzFxK/rQLIsBXcbwAUSEa3scgwibzkFcjXWlimOtNe+e2VlKH1/UsCZsPl\nRvt8AjvUz1OzONwOrohLfthiUwKBgQC4/g43PO7Bpg1sAHFvzsuTylAxqiI/2BL2\noR+kWl59EY2d/iddrQmN4p92rDHqnIm8RVgY1GMSVL0hUH7/nUDtBnBiZGOolS2R\nl4g507PQamsuWVAf6EaHG2h62gn5xjIICUs463gt2cURimgnxFYY8jp1qiq0vuTS\ntfJmF7wd9wKBgDL9GucW4/HKy+NNXSaelPY1IC6TmM8ermWzgBZycGI8piPcpECH\ndqffjQpH7w8Kj6xx6gBVLT7KiR0ZUOCOoSU+pZC79DqSMwlY+5dy1hyO1HAKkmmG\nWHx45r+PwcAEKS87XVrI+wJHaWmsFzGlXUEv/uWsdmBWIQCunoUlqTsNAoGBALKK\n4QWHFZhov4OBWfpjSDA3jvagEbY0wPivwW5Kme9zxY67ARt0Kkh6dRWAVBzvQDAp\nbUFpmsTSbEd+/VOPXl5lXIpaAaVvdS+TZLMLE/0O+KsfICnrcEZtuYT4c7BSDW+c\nKLGi8bau+3hWcPgQklg5URrHRbh0lTyYxn6qYbE5AoGBAKvAuALh/aHNtW6Er5D9\ncAsXDnaeBRmC8FFn89u9g5NdIJI9D7V80GfUyVfyzr1CNFevOUTj2OXdaP/iKVmD\nf2/8oxSuzhnhJMh1nofOSTp1TNBXNeYIJf/PDJ5onKEkFin2BtvZslnFhmySQXAi\nluLNCG4uy8KuK90rn6b0VAFf\n-----END PRIVATE KEY-----\n",
  client_email: "firebase-adminsdk-hms83@juncoffee-b2b2f.iam.gserviceaccount.com",
  client_id: "116950801664495655802",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-hms83%40juncoffee-b2b2f.iam.gserviceaccount.com",
};

admin.initializeApp({ config });

module.exports = admin;
