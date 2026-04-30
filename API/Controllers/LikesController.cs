using Microsoft.AspNetCore.Mvc;
using Application;
using Application.DataTransfer.Likes;
using Application.Commands.Like;

namespace API.Controllers
{
    [ApiController]
    [Route("api/likes")]
    public class LikesController : ControllerBase
    {
        private readonly UseCaseExecutor _executor;
        private readonly IApplicationActor _actor;

        public LikesController(UseCaseExecutor executor, IApplicationActor actor)
        {
            _executor = executor;
            _actor = actor;
        }

        [HttpPost("posts/{id}")]
        public async Task<IActionResult> LikePost([FromBody] LikeDto dtoRequest, [FromServices] ILikePostCommand command)
        {
            dtoRequest.IdUser = _actor.Id;
            await _executor.ExecuteCommandAsync(command, dtoRequest);
            return Ok(dtoRequest);
        }

        [HttpPost("comments/{id}")]
        public async Task<IActionResult> LikeComment(int id, [FromBody] LikeDto dtoRequest, [FromServices] ILikeCommentCommand command)
        {
            dtoRequest.IdUser = _actor.Id;
            dtoRequest.IdComment = id;
            await _executor.ExecuteCommandAsync(command, dtoRequest);
            return Ok(dtoRequest);
        }

        [HttpDelete("comments/{id}")]
        public async Task<IActionResult> UnlikeComment(int id, [FromServices] IUnlikeCommentCommand command)
        {
            var dtoRequest = new LikeDto
            {
                IdUser = _actor.Id,
                IdComment = id
            };
            
            await _executor.ExecuteCommandAsync(command, dtoRequest);
            return NoContent();
        }

        [HttpDelete("posts/{id}")]
        public async Task<IActionResult> UnlikePost(int id, [FromServices] IUnlikePostCommand command)
        {
            var dtoRequest = new LikeDto
            {
                IdUser = _actor.Id,
                IdPost = id
            };

            await _executor.ExecuteCommandAsync(command, dtoRequest);
            return NoContent();
        }
    }
}