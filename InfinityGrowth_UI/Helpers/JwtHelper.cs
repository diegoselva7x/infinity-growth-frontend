using System.IdentityModel.Tokens.Jwt;

namespace InfinityGrowth_UI.Helpers
{
    public static class JwtHelper
    {
        public static int? GetUserIdFromContext(HttpContext httpContext)
        {
            if (httpContext == null || httpContext.User == null || !httpContext.User.Identity.IsAuthenticated)
                return null;

            var userIdClaim = httpContext.User.Claims.FirstOrDefault(c => c.Type == "UserId");

            if (userIdClaim != null && int.TryParse(userIdClaim.Value, out int userId))
                return userId;

            return null;
        }

        public static string? GetClaimFromContext(HttpContext context, string claimType)
        {
            return context.User?.Claims.FirstOrDefault(c => c.Type == claimType)?.Value;
        }
    }

}
