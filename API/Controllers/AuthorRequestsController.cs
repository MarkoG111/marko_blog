using Application;
using Microsoft.AspNetCore.Mvc;
using Application.DataTransfer.AuthorRequests;
using Application.Queries.AuthorRequest;
using Application.Commands.AuthorRequest;
using Application.Searches;

namespace API.Controllers
{
    [ApiController]
    [Route("api/authorrequests")]
    public class AuthorRequestsController : ControllerBase
    {
        private readonly UseCaseExecutor _executor;
        private readonly IApplicationActor _actor;

        public AuthorRequestsController(UseCaseExecutor executor, IApplicationActor actor)
        {
            _executor = executor;
            _actor = actor;
        }

        [HttpPost]
        public IActionResult Post([FromBody] UpsertAuthorRequestDto dtoRequest, [FromServices] ICreateAuthorRequestCommand command)
        {
            dtoRequest.IdUser = _actor.Id;
            _executor.ExecuteCommand(command, dtoRequest);
            return Ok(dtoRequest);
        }

        [HttpGet]
        public IActionResult Get([FromServices] IGetAuthorRequestsQuery query, [FromQuery] AuthorRequestSearch search)
        {
            return Ok(_executor.ExecuteQuery(query, search));
        }

        [HttpPut("accept")]
        public IActionResult Accept([FromQuery] int id, [FromBody] UpsertAuthorRequestDto dtoRequest, [FromServices] IUpdateAuthorRequestCommand command)
        {
            dtoRequest.Id = id;
            dtoRequest.IdRole = 3;
            _executor.ExecuteCommand(command, dtoRequest);
            return NoContent();
        }

        [HttpPut("reject")]
        public IActionResult Reject([FromQuery] int id, [FromBody] UpsertAuthorRequestDto dtoRequest, [FromServices] IUpdateAuthorRequestCommand command)
        {
            dtoRequest.Id = id;
            dtoRequest.IdRole = 2;
            _executor.ExecuteCommand(command, dtoRequest);
            return NoContent();
        }
    }
}