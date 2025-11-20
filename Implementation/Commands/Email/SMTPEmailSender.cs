using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Application.Commands.Email;
using Application.DataTransfer.Emails;
using System.Net;
using Application.Settings;
using System.Net.Mail;
using Microsoft.Extensions.Options;

namespace Implementation.Commands.Email
{
    public class SMTPEmailSender : IEmailSender
    {
        private readonly SMTPSettings _emailSettings;

        public SMTPEmailSender(IOptions<SMTPSettings> emailSettings)
        {
            _emailSettings = emailSettings.Value;
        }

        public void Send(SendEmailDto dto)
        {
            var smtp = new SmtpClient
            {
                Host = _emailSettings.Host,
                Port = _emailSettings.Port,
                EnableSsl = true,
                DeliveryMethod = SmtpDeliveryMethod.Network,
                UseDefaultCredentials = false,

                Credentials = new NetworkCredential(
                    _emailSettings.Username,
                    _emailSettings.Password
                )
            };
            var message = new MailMessage(_emailSettings.SenderEmail, dto.SendTo)
            {
                Subject = dto.Subject,
                Body = dto.Content,
                IsBodyHtml = true
            };

            smtp.Send(message);
        }
    }
}