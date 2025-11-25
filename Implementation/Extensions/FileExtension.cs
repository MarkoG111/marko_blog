using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.IO;
using Microsoft.AspNetCore.Http;

namespace Implementation.Extensions
{
    public static class FileExtension
    {
        public static async Task<string> UploadProfileImage(this IFormFile image, string folder, string oldFileName = null)
        {
            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "UserImages");

            // Create folder if missing
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            // Delete old file if exists
            if (!string.IsNullOrEmpty(oldFileName))
            {
                var oldFilePath = Path.Combine(uploadsFolder, oldFileName);
                if (File.Exists(oldFilePath))
                    File.Delete(oldFilePath);
            }

            // New file generation
            var guid = Guid.NewGuid();
            var extension = Path.GetExtension(image.FileName);
            var newFileName = guid + extension;

            var path = Path.Combine(uploadsFolder, newFileName);

            using (var fileStream = new FileStream(path, FileMode.Create))
            {
                await image.CopyToAsync(fileStream);
            }

            return newFileName;
        }
    }
}