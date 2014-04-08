using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(SiblingWebApp.Startup))]
namespace SiblingWebApp
{
    public partial class Startup {
        public void Configuration(IAppBuilder app) {
            ConfigureAuth(app);
        }
    }
}
