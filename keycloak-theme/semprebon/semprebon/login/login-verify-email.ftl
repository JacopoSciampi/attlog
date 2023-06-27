<#import "template.ftl" as layout>
<@layout.registrationLayout displayInfo=true; section>
<p class="instruction">
${msg("customEmailVerify2")}
<a href="${url.loginAction}">${msg("customDoClickHere")}</a> ${msg("emailVerifyInstruction3")}
</p>
</@layout.registrationLayout>